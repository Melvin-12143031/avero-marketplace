import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  Users,
} from "lucide-react";

const AdminLayout = () => {
  const navigation = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      name: "Inventory",
      path: "/admin/inventory",
      icon: Boxes,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingBag,
    },

    {
      name: "Customers",
      path: "/admin/customers",
      icon: Users,
    },
  ];

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row">
      <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-4 md:w-60">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Administration
        </h2>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <section className="min-w-0 flex-1">
        <Outlet />
      </section>
    </div>
  );
};

export default AdminLayout;
