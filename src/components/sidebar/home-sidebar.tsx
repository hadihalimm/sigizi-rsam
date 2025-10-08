import { Sidebar, SidebarContent, SidebarHeader } from "../ui/sidebar";
import NavGroup from "./nav-group";
import { appGroup } from "./sidebar-items";

export default function HomeSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="flex justify-center items-center">
        <h1>SIGIZI RSAM</h1>
      </SidebarHeader>

      <SidebarContent>
        <NavGroup groupLabel="Aplikasi" items={appGroup} />
      </SidebarContent>
    </Sidebar>
  );
}
