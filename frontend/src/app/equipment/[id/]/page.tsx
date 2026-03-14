import EquipmentDetailsClient from "./EquipmentDetailsClient";

// 1. Specify that dynamic params are allowed at runtime
export const dynamicParams = true;

// 2. Satisfy the build requirement for static export
export function generateStaticParams() {
    return []; // Return an empty array so Next.js doesn't try to build every ID
}

export default function EquipmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Just pass the params through to our client component
    return <EquipmentDetailsClient params={params} />;
}
