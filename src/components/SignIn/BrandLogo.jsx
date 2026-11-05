// The same brand mark is used on both authentication screens.
const BrandLogo = ({ small = false }) => (
  <span className={`signin-logo${small ? " signin-logo--small" : ""}`} role="img" aria-label="نشان گروه مهندسی صادق یکتا">
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcSet="/brand/sata.svg" />
      <img src="/brand/sata-motion.svg" alt="" />
    </picture>
  </span>
);

export default BrandLogo;
