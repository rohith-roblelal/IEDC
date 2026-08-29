import React from "react";
import JsonLd from "./JsonLd";

interface BreadcrumbItem {
  name: string;
  item: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export default function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  if (!items || items.length === 0) return null;

  // The last item determines the canonical URL of the current page for the @id.
  const currentUrl = items[items.length - 1].item;

  const data = {
    "@id": `${currentUrl}#breadcrumb`,
    itemListElement: items.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.item,
    })),
  };

  return <JsonLd type="BreadcrumbList" data={data} />;
}
