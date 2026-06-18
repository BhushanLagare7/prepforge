type JsonLdProps = {
  data: Record<string, unknown>;
};

/**
 * Renders a JSON-LD structured data <script> tag.
 * The `<` character is escaped to prevent XSS via embedded scripts.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}
