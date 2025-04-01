import { Link, useLocation } from "react-router-dom";
const Header = () => {
    const location = useLocation(); const isAdminPage = location.pathname.includes('/admin');
    return (
        <nav className={`bg-white shadow border-b transition-colors duration-200`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="text-2xl font-bold text-[#3a5a78]">QwerVego</div>
                    <div>
                        {!isAdminPage &&
                            (
                                <Link to="/admin/login"
                                    className="inline-flex items-center px-4 py-2 border border-[#3a5a78] text-[#3a5a78] rounded-md hover:bg-[#3a5a78] hover:text-white transition-colors duration-200"              >
                                    Admin Login

                                </Link>
                            )}

                    </div>
                </div>
            </div>
        </nav>);
};

export default Header;














