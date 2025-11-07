import { Sidebar, SidebarContent, SidebarHeader } from "../ui/sidebar";
import NavGroup from "./nav-group";
import { adminGroup, appGroup } from "./sidebar-items";

export default function HomeSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="flex justify-center items-center">
        <div className="bg-primary/20 p-2 rounded-md">
          <h1 className="text-2xl text-primary font-bold">SIGIZI</h1>
        </div>
        <p className="text-sm text-muted-foreground">RSUD Dr. Achmad Mochtar</p>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup groupLabel="Aplikasi" items={appGroup} />
        <NavGroup groupLabel="Admin" items={adminGroup} />
      </SidebarContent>
    </Sidebar>
  );
}
