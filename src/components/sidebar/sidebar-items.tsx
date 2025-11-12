import {
  Bean,
  Bed,
  BookUser,
  Carrot,
  ClipboardList,
  Fish,
  Hamburger,
  HandPlatter,
  LayoutDashboard,
  Table,
} from "lucide-react";

interface groupProps {
  title: string;
  url: string;
  icon?: React.ReactNode;
}

export const appGroup: groupProps[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: <LayoutDashboard className="size-5" />,
  },
  {
    title: "Permintaan Makanan",
    url: "/permintaan-makanan",
    icon: <Table className="size-5" />,
  },
  {
    title: "Pemesanan Makanan",
    url: "/pemesanan-makanan",
    icon: <ClipboardList className="size-5" />,
  },
  {
    title: "Daftar Pasien",
    url: "/pasien",
    icon: <BookUser className="size-5" />,
  },
];

export const adminGroup: groupProps[] = [
  {
    title: "Daftar Menu",
    url: "/admin/menu-book",
    icon: <HandPlatter className="size-5" />,
  },
  {
    title: "Daftar Makanan & Snack",
    url: "/admin/makanan",
    icon: <Hamburger className="size-5" />,
  },
  {
    title: "Daftar Bahan Makanan",
    url: "/admin/bahan-makanan  ",
    icon: <Carrot className="size-5" />,
  },
  {
    title: "Daftar Diet",
    url: "/admin/diet",
    icon: <Fish className="size-5" />,
  },
  {
    title: "Daftar Alergi",
    url: "/admin/alergi",
    icon: <Bean className="size-5" />,
  },
  {
    title: "Daftar Ruangan",
    url: "/admin/ruangan",
    icon: <Bed className="size-5" />,
  },
];
