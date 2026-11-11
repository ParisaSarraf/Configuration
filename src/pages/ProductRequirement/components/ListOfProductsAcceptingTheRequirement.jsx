import { Alert, Button, Card, Empty, Spin, Tag } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Tree from "../../../components/Tree";
import RequirementDescription from "./RequirementDescription";
import { useProductRequirementAcceptor } from "../../../QueryServises/productRequirementQuery";
import { mapAcceptorProducts } from "../utils/acceptorProducts";
import { buildRequirementTree, getAssignmentState, getBranchKeys, getRequirementState } from "../utils/requirementTree";

export default function ListOfProductsAcceptingTheRequirement({ selectedEdition, onOpenProduct }) {
  const editionId = selectedEdition?.id;
  const { data, isFetching, isError, isSuccess, refetch } = useProductRequirementAcceptor(editionId);
  const products = mapAcceptorProducts(data);
  const selectedLabel = selectedEdition?.full_code || selectedEdition?.code || editionId;

  // Category IDs and edition IDs can occur in multiple products: scope every key.
  const mapNodes = (nodes, prefix) => nodes.map((node) => {
    const assignments = node.kind === "edition" && node.isImported
      ? (Array.isArray(node.edition.assigned_to) ? node.edition.assigned_to : []).filter((item) => item?.is_current_product === true)
      : [];
    const state = node.kind === "edition" && assignments.length === 1
      ? getAssignmentState(assignments[0].state)
      : node.kind === "edition" && !node.isImported ? getRequirementState(node.edition.state) : null;
    return {
      ...node,
      key: `${prefix}${node.key}`,
      title: <span>
        {node.kind === "edition" ? <bdi dir="ltr">{node.label}</bdi> : node.label}
        {node.kind === "requirement" && <RequirementDescription value={node.requirement} />}
        {node.kind === "edition" && <RequirementDescription value={node.edition} />}
        {node.kind === "edition" && node.isImported && <Tag color="blue" className="mx-1">واردشده</Tag>}
        {state && <Tag color={state.color} className="mx-1">{state.label}</Tag>}
        {assignments.length > 1 && <Tag className="mx-1">چند تخصیص</Tag>}
      </span>,
      children: mapNodes(node.children, prefix),
    };
  });
  const treeData = products?.map((item) => ({
    key: item.key,
    kind: "product",
    product: item.product,
    title: <span className="font-semibold">{item.title}
      {item.code != null && item.code !== "" && <> — <bdi dir="ltr">{item.code}</bdi></>}
      <span className="mx-1 text-xs text-slate-500">(شناسه: <bdi dir="ltr">{item.id}</bdi>)</span>
      <ArrowLeftOutlined className="mx-1 text-blue-500" aria-label="بازکردن الزامات محصول" />
    </span>,
    children: mapNodes(buildRequirementTree(item.requirementTree), `${item.key}`),
  }));

  return <Card title="لیست محصولات پذیرنده نسخه الزام">
    {editionId == null ? <Empty description="برای نمایش محصولات پذیرنده، یک نسخه از درخت انتخاب کنید" /> : <>
      <div className="mb-3">نسخه انتخاب‌شده: <bdi dir="ltr">{selectedLabel}</bdi></div>
      {isFetching && <div role="status" className="mb-2"><Spin size="small" /> در حال دریافت محصولات پذیرنده...</div>}
      {isError && <Alert type="error" showIcon className="mb-2"
        message={products ? "به‌روزرسانی محصولات پذیرنده ناموفق بود؛ داده‌های قبلی نمایش داده می‌شوند" : "دریافت محصولات پذیرنده ناموفق بود"}
        action={<Button onClick={() => refetch()}>تلاش دوباره</Button>} />}
      {!isFetching && isSuccess && !products && <Alert type="error" showIcon
        message="پاسخ محصولات پذیرنده معتبر نیست" action={<Button onClick={() => refetch()}>تلاش دوباره</Button>} />}
      {products && (products.length ? <>
        <p className="mb-2 text-xs text-slate-500">برای مشاهده و انجام روال، روی نام محصول کلیک کنید.</p>
        <Tree key={editionId} mode="tree" data={treeData} showLine checkable={false}
          defaultExpandedKeys={getBranchKeys(treeData)} showRightClickMenu={false}
          onSelect={(_, { node, selected }) => {
            if (selected && node.kind === "product") onOpenProduct?.(node.product);
          }} />
      </> : <Empty description="این نسخه هنوز به محصولی ارسال نشده است" />)}
    </>}
  </Card>;
}
