const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\u064A\u0649]/g, "\u06CC")
    .replace(/\u0643/g, "\u06A9")
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "");

const ROUTE_FIELDS = [
  "path",
  "url",
  "route",
  "href",
  "slug",
  "code",
  "name",
  "title",
  "persian_title",
  "english_title",
  "display_name",
  "label",
];

const CAPABILITY_ALIASES = Object.freeze({
  formBuilder: [
    "forms",
    "form",
    "form-builder",
    "form_builder",
    "form builder",
    "form builder studio",
    "فرم ساز",
    "فرمساز",
    "مدیریت فرم",
  ],
  processBuilder: [
    "processes",
    "process-builder",
    "process_builder",
    "process builder",
    "workflow builder",
    "فرایند ساز",
    "فرآیند ساز",
    "فرایندساز",
    "فرآیندساز",
    "مدیریت فرایند",
    "مدیریت فرآیند",
  ],
});

const matchesCapability = (values, capability) => {
  const aliases = CAPABILITY_ALIASES[capability].map(normalize);
  return values.some((value) => {
    const candidate = normalize(value);
    if (!candidate) return false;
    return aliases.some(
      (alias) => candidate === alias || candidate.startsWith(alias),
    );
  });
};

const descriptorValues = (item) => {
  if (typeof item === "string") return [item];
  if (!item || typeof item !== "object") return [];
  return ROUTE_FIELDS.map((field) => item?.[field]).filter(
    (value) => typeof value === "string" || typeof value === "number",
  );
};

const collectAccessibleProductValues = (payload) => {
  const values = [];
  const visited = new Set();

  const walk = (value, productContext = false) => {
    if (value == null || visited.has(value)) return;
    if (typeof value === "string" || typeof value === "number") {
      if (productContext) values.push(value);
      return;
    }
    if (typeof value !== "object") return;
    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, productContext));
      return;
    }

    const looksLikeProduct =
      productContext ||
      ROUTE_FIELDS.some((field) =>
        [
          "persian_title",
          "english_title",
          "path",
          "url",
          "route",
          "slug",
          "code",
        ].includes(field)
          ? value?.[field] != null
          : false,
      );
    if (looksLikeProduct) values.push(...descriptorValues(value));

    Object.entries(value).forEach(([key, child]) => {
      const normalizedKey = normalize(key);
      const childIsProduct =
        looksLikeProduct ||
        [
          "product",
          "products",
          "children",
          "access",
          "accesses",
          "results",
          "data",
        ].includes(normalizedKey);
      walk(child, childIsProduct);
    });
  };

  walk(payload, false);
  return values;
};

const accessiblePageValues = (pages) => {
  const values = [];
  const walk = (value) => {
    if (value == null) return;
    if (typeof value === "string" || typeof value === "number") {
      values.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === "object") {
      values.push(...descriptorValues(value));
      Object.values(value).forEach(walk);
    }
  };
  walk(pages);
  return values;
};

export const resolveBuilderAccess = (user, accessPayload) => {
  if (user?.is_staff === true || user?.is_superuser === true) {
    return { formBuilder: true, processBuilder: true };
  }

  const values = [
    ...accessiblePageValues(user?.accessible_pages ?? []),
    ...collectAccessibleProductValues(accessPayload),
  ];

  return {
    formBuilder: matchesCapability(values, "formBuilder"),
    processBuilder: matchesCapability(values, "processBuilder"),
  };
};
