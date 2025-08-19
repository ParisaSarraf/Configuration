import {useProductContext} from "@/Services/Context/ProductContext.jsx";
import {DocumentStateList} from "@/pages/Reports/components/CollapseTableReport/DocumentStateList.jsx";
import PieChartWithFilter from "@/pages/Reports/components/PieChartReport/PieChartWithFilter.jsx";

const Reports = () => {
    const {currentProduct} = useProductContext();
    const ProductIds = currentProduct?.id

    return (
        <div className="w-full grid grid-cols-2 gap-1">
            <div>
                <DocumentStateList productId={ProductIds}/>
            </div>
            <div>
                <PieChartWithFilter productId={ProductIds}/>
            </div>

        </div>
    );
};

export default Reports;
