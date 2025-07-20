export const checkEditionDuplicate = (
	treeData,
	editionName,
	ignoreId = null
) => {
	if (!treeData || !editionName) return false;
	console.log(editionName);
	console.log(treeData);

	const getLastPart = (editionStr) => {
		const parts = editionStr.split("/");
		return parts[parts.length - 1];
	};
	const checkNode = (node) => {
		if (Array.isArray(node.edition)) {
			if (
				node.edition.some(
					(ed) => getLastPart(ed.edition) === editionName && ed.id !== ignoreId
				)
			) {
				return true;
			}
		}
		if (Array.isArray(node.children) && node.children.length > 0) {
			return node.children.some((child) => checkNode(child));
		}
		return false;
	};

	if (Array.isArray(treeData)) {
		return treeData.some((node) => checkNode(node));
	}
	return checkNode(treeData);
};
