"use client";

import dynamic from "next/dynamic";

const AdminSidebar = dynamic(
  () => import("./admin-sidebar").then((mod) => mod.AdminSidebar),
  { ssr: false }
);

export default function AdminSidebarWrapper() {
  return <AdminSidebar />;
}
