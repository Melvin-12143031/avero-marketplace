import { Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";

const StorefrontLayout = ({ cartCount, onCartClick }) => {
  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#1C1C1C]">
      <Header cartCount={cartCount} onCartClick={onCartClick} />

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default StorefrontLayout;
