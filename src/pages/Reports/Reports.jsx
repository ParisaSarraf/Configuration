import { useCallback, useState } from "react";
import { Form, message } from "antd";
import { useProductContext } from "@/Services/Context/ProductContext.jsx";
import { DocumentStateList } from "@/pages/Reports/components/CollapseTableReport/DocumentStateList.jsx";
import PieChartReport from "@/pages/Reports/components/PieChartReport/PieChartReport.jsx";
import ReportFilters from "@/pages/Reports/components/ReportFilters.jsx";
import { useDocumentList } from "@/QueryServises/documentQuery/index.js";

const Reports = () => {
  const { currentProduct } = useProductContext();
  const ProductId = currentProduct?.id;

  const [form] = Form.useForm();
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const { data: documentList } = useDocumentList();

  const handleFinish = useCallback(async (values) => {
    setLoading(true);
    try {
      const formattedFilters = {
        ...values,
        document_tree_id: values.document_tree_id || undefined,
        states:
          values.states && values.states.length > 0
            ? values.states.join(",")
            : undefined,
        files_number:
          values.files_number && values.files_number.length > 0
            ? values.files_number.join(",")
            : undefined,
        with_children: values.with_children,
      };

      Object.keys(formattedFilters).forEach((key) => {
        if (
          formattedFilters[key] === undefined ||
          formattedFilters[key] === "" ||
          formattedFilters[key] === null
        ) {
          delete formattedFilters[key];
        }
      });

      setFilters(formattedFilters);
      message.success("فیلترها با موفقیت اعمال شدند");
    } catch (error) {
      message.error("خطا در اعمال فیلترها");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    form.resetFields();
    setFilters({});
    message.info("فیلترها بازنشانی شدند");
  }, [form]);

  return (
    <div className="w-full">
      <ReportFilters
        form={form}
        onFinish={handleFinish}
        onReset={handleReset}
        loading={loading}
        documentList={documentList}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <DocumentStateList productId={ProductId} filters={filters} />
        </div>
        <div>
          <PieChartReport currentProduct={currentProduct} filters={filters} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
