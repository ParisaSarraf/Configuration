export const flattenDataForExcel = (nestedData) => {
    if (!nestedData || !Array.isArray(nestedData)) {
        return [];
    }

    const flattenedRows = [];

    nestedData.forEach(parentItem => {
        if (parentItem.product_purchase_numbers && Array.isArray(parentItem.product_purchase_numbers) && parentItem.product_purchase_numbers.length > 0) {

            const {product_purchase_numbers, ...parentData} = parentItem;

            product_purchase_numbers.forEach(purchaseItem => {
                const newRow = {
                    ...parentData,
                    product: purchaseItem.product,
                    confirmed_number: purchaseItem.confirmed_number,
                    export_description: purchaseItem.export_description,
                    total_number: purchaseItem.date,

                };
                flattenedRows.push(newRow);
            });
        } else {
            flattenedRows.push(parentItem);
        }
    });

    return flattenedRows;
};