// removes unknown values, type validation, enum validation, regex validation, regex conversion for regex searching, required value check
export const validateInput = (rules, options = {}) => {
  const { mode = "auto" } = options;

  return (req, res, next) => {
    const isQuerySource =
      mode === "query"
        ? true
        : mode === "body"
        ? false
        : Object.keys(req.query).length > 0;

    const source = isQuerySource ? req.query : req.body;

    const cleaned = {};

    const allowedKeys = Object.keys(rules);

    for (const incomingKey of Object.keys(source)) {
      if (!allowedKeys.includes(incomingKey)) {
        // silently drop unknown fields
        delete source[incomingKey];
      }
    }

    for (const key in rules) {
      const rule = rules[key];
      let value = source[key];

      // Required fields
      if (rule.required && (value === undefined || value === "")) {
        return res.status(400).json({
          success: false,
          error: `Field '${key}' is required.`,
        });
      }

      // Skip missing optional fields
      if (value === undefined) continue;

      // Trim strings
      if (typeof value === "string") value = value.trim();

      // Type validation
      switch (rule.type) {
        case "string":
          if (typeof value !== "string") {
            return res.status(400).json({
              success: false,
              error: `Field '${key}' must be a string.`,
            });
          }

          if (rule.minLength !== undefined && value.length < rule.minLength) {
            return res.status(400).json({
              success: false,
              error: `'${key}' must be at least ${rule.minLength} characters.`,
            });
          }

          if (rule.maxLength !== undefined && value.length > rule.maxLength) {
            return res.status(400).json({
              success: false,
              error: `'${key}' cannot exceed ${rule.maxLength} characters.`,
            });
          }
          break;

        case "number":
          value = Number(value);
          if (isNaN(value)) {
            return res.status(400).json({
              success: false,
              error: `Field '${key}' must be a valid number.`,
            });
          }
          if (rule.min !== undefined && value < rule.min) {
            return res.status(400).json({
              success: false,
              error: `'${key}' cannot be less than ${rule.min}.`,
            });
          }
          if (rule.max !== undefined && value > rule.max) {
            return res.status(400).json({
              success: false,
              error: `'${key}' cannot be more than ${rule.max}.`,
            });
          }
          break;

        case "boolean":
          if (value === "true") value = true;
          else if (value === "false") value = false;
          else if (typeof value !== "boolean") {
            return res.status(400).json({
              success: false,
              error: `Field '${key}' must be boolean.`,
            });
          }
          break;

        case "array":
          if (!Array.isArray(value)) {
            return res.status(400).json({
              success: false,
              error: `Field '${key}' must be an array.`,
            });
          }
          break;

        case "object":
          if (
            value === null ||
            typeof value !== "object" ||
            Array.isArray(value)
          ) {
            return res.status(400).json({
              success: false,
              error: `Field '${key}' must be an object.`,
            });
          }
          break;

        default:
          return res.status(500).json({
            success: false,
            error: `Invalid rule type for '${key}'.`,
          });
      }

      // Enum validation
      if (rule.enum) {
        if (Array.isArray(value)) {
          const invalid = value.filter((v) => !rule.enum.includes(v));
          if (invalid.length > 0) {
            return res.status(400).json({
              success: false,
              error: `Invalid values for '${key}': ${invalid.join(
                ", "
              )}. Allowed: ${rule.enum.join(", ")}`,
            });
          }
        } else if (!rule.enum.includes(value)) {
          return res.status(400).json({
            success: false,
            error: `Invalid value for '${key}'. Allowed: ${rule.enum.join(
              ", "
            )}`,
          });
        }
      }

      // Regex validation
      if (rule.regex && typeof value === "string" && !rule.regex.test(value)) {
        return res.status(400).json({
          success: false,
          error: `Invalid format for '${key}'.`,
        });
      }

      // Support regex filters
      if (rule.isRegex && typeof value === "string") {
        cleaned[key] = { $regex: new RegExp(value, "i") };
      } else {
        cleaned[key] = value;
      }
    }

    // Save cleaned input
    if (isQuerySource) req.cleanedQuery = cleaned;
    else req.cleanedBody = cleaned;

    next();
  };
};
