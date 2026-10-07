// Normalizes the requirement tree returned by the API so that the tree and the
// table can share the same data (and so every node knows its parent).
export const normalizeRequirements = (list, parentId = null) => {
    if (!list) return [];
    const items = Array.isArray(list) ? list : [list];
    return items.filter(Boolean).map((node) => {
        const children = Array.isArray(node.children) && node.children.length > 0
            ? normalizeRequirements(node.children, node.id)
            : undefined;
        return {
            key: `requirement-${node.id}`,
            id: node.id,
            title: node.persian_title || node.title,
            persian_title: node.persian_title || node.title,
            english_title: node.english_title || node.englishTitle,
            code: node.code,
            is_definable: node.is_definable,
            life_cycle: node.life_cycle,
            parentId,
            children,
        };
    });
};
