import NavbarProfile from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarProfile />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
