import { AttributeManagementContent } from "@/components/admin/customer-management/attribute-management-content";

export default function Page() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
          Attribute Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create, edit, and delete customer attributes (VIP, Smoking, Owner&apos;s Friend, etc.).
        </p>
      </div>

      <AttributeManagementContent />
    </div>
  );
}
