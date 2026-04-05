import { adminService } from "@/server/services/admin.service";
import AdminClient from "./admin-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ userPage?: string; listingPage?: string }> 
}) {
  const { userPage, listingPage } = await searchParams;
  const uPage = Number(userPage) || 1;
  const lPage = Number(listingPage) || 1;

  const stats = await adminService.getDashboardStats();
  const listingsData = await adminService.getAllListings(lPage, 20);
  const usersData = await adminService.getAllUsers(uPage, 20);

  return <AdminClient 
    stats={stats} 
    listingsData={listingsData} 
    usersData={usersData} 
  />;
}
