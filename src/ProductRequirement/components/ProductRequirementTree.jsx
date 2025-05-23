import { Card } from 'antd'
import { useProductContext } from '../../Services/Context/ProductContext';

const ProductRequirementTree = () => {
    const { currentProduct } = useProductContext();

    return (
        <Card title={`الزامات محصول ${currentProduct?.name || ''}`}>

        </Card>
    )
}

export default ProductRequirementTree
