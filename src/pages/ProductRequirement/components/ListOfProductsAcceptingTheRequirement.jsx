import { Alert, Button, Card, Empty, Spin } from "antd";
import Tree from "../../../components/Tree";
import { useProductRequirementAcceptor } from "../../../QueryServises/productRequirementQuery";
import { mapAcceptorProducts } from "../utils/acceptorProducts";

export default function ListOfProductsAcceptingTheRequirement({ selectedEdition }) {
  const editionId = selectedEdition?.id;
  const { data, isFetching, isError, isSuccess, refetch } = useProductRequirementAcceptor(editionId);
  const products = mapAcceptorProducts(data);
  const treeData = products?.map((product) => ({
    ...product,
    title: <span>{product.title}
      {product.code != null && product.code !== "" && <> — <bdi dir="ltr">{product.code}</bdi></>}
      {product.id != null && <span> (شناسه: <bdi dir="ltr">{product.id}</bdi>)</span>}
    </span>,
    isLeaf: true,
  }));
  const selectedLabel = selectedEdition?.full_code || selectedEdition?.code || editionId;

  return <Card title="لیست محصولات پذیرنده نسخه الزام">
    {editionId == null ? <Empty description="برای نمایش محصولات پذیرنده، یک نسخه از درخت انتخاب کنید" /> : <>
      <div className="mb-3">نسخه انتخاب‌شده: <bdi dir="ltr">{selectedLabel}</bdi></div>
      {isFetching && <div role="status" className="mb-2"><Spin size="small" /> در حال دریافت محصولات پذیرنده...</div>}
      {isError && <Alert type="error" showIcon className="mb-2"
        message={products ? "به‌روزرسانی محصولات پذیرنده ناموفق بود؛ داده‌های قبلی نمایش داده می‌شوند" : "دریافت محصولات پذیرنده ناموفق بود"}
        action={<Button onClick={() => refetch()}>تلاش دوباره</Button>} />}
      {!isFetching && isSuccess && !products && <Alert type="error" showIcon
        message="پاسخ محصولات پذیرنده معتبر نیست" action={<Button onClick={() => refetch()}>تلاش دوباره</Button>} />}
      {products && (products.length ? <Tree key={editionId} mode="tree" data={treeData} showLine checkable={false}
        showRightClickMenu={false} /> : <Empty description="این نسخه هنوز به محصولی ارسال نشده است" />)}
    </>}
  </Card>;
}
