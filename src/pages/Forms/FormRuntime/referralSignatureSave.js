// The supplied frontend exposes separate action/update endpoints, no transaction.
// A failed signature write must NOT execute the workflow action again.
export const verifySignatureSave = (result) => {
  if (result?.verification?.checked && !result.verification.ok)
    throw new Error("بازخوانی امضا با دادهٔ ارسالی یکسان نیست.");
  return result;
};
export const referThenSign = async ({ refer, prepare, persist }) => {
  await refer(); // no signature is committed when the action fails
  let prepared;
  try {
    prepared = prepare();
    if (!prepared) return { referred: true, signatureCount: 0 };
    const result = verifySignatureSave(await persist(prepared));
    return { referred: true, signatureCount: prepared.count, prepared, verified: Boolean(result?.verification?.checked) };
  } catch (error) {
    return { referred: true, signatureCount: 0, prepared, signatureError: error };
  }
};
