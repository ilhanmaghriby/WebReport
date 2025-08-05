import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.webp";
import Logo2 from "../assets/logo-2.webp";
import Logo4 from "../assets/logo4.webp";
import Swal from "sweetalert2";

export default function NavbarProfile() {
  const [open, setOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [user, setUser] = useState({ username: "", role: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Ganti VIDEO_ID dengan ID video YouTube yang diinginkan
  const VIDEO_URL =
    "https://www.youtube.com/embed/v6UHkGyjpfo?si=_hKrq8q2_vODlm51";

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) setScrolled(isScrolled);
    };
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => document.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#F15A24",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        navigate("/");
        Swal.fire({
          title: "Logged Out",
          text: "You have been successfully logged out",
          icon: "success",
          timer: 1500,
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div
        className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-white border-b border-gray-200 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="px-6 py-3 flex items-center justify-between">
          <img src={Logo} alt="Logo" className="w-24 md:w-32" />
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white border-b border-gray-200 shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={Logo2}
            alt="Logo"
            className="w-16 mr-2 md:mr-4 hover:opacity-90 transition-opacity"
          />
          <img
            src={Logo4}
            alt="Logo"
            className="w-16 mr-2 md:mr-4 hover:opacity-90 transition-opacity"
          />
          <img
            src={Logo}
            alt="Logo"
            className="w-24 md:w-32 hover:opacity-90 transition-opacity"
          />
        </Link>

        {/* User profile / Actions */}
        <div className="flex items-center space-x-4">
          {/* Video Guide Button (Always visible) */}
          <button
            onClick={() => setShowVideo(true)}
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-sm text-white bg-[#2E3B4E] hover:bg-[#253046] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E3B4E] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.5 3.5a.5.5 0 01.5-.5h.75a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-.75a.5.5 0 01-.5-.5v-13zM6.5 10l6 3.5V6.5L6.5 10z"
                clipRule="evenodd"
              />
            </svg>
            Video Panduan
          </button>

          {/* Video Guide Button (Mobile) - Only SVG */}
          <button
            onClick={() => setShowVideo(true)}
            className="sm:hidden inline-flex items-center p-2 border border-transparent rounded-lg shadow-sm text-white bg-[#2E3B4E] hover:bg-[#253046] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E3B4E] transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4.5 3.5a.5.5 0 01.5-.5h.75a.5.5 0 01.5.5v13a.5.5 0 01-.5.5h-.75a.5.5 0 01-.5-.5v-13zM6.5 10l6 3.5V6.5L6.5 10z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {token ? (
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 focus:outline-none group"
                aria-label="User menu"
                aria-expanded={open}
              >
                <div className="hidden sm:flex flex-col items-end leading-tight">
                  <span className="font-medium text-sm text-gray-800 group-hover:text-[#F15A24] transition-colors">
                    {user.username.charAt(0).toUpperCase() +
                      user.username.slice(1)}
                  </span>
                </div>

                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#F15A24] flex items-center justify-center text-white font-medium text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <svg
                    className={`absolute -bottom-1 -right-4 w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      open ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </div>
              </button>

              {/* Dropdown Menu */}
              {open && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user.username.charAt(0).toUpperCase() +
                        user.username.slice(1)}
                    </p>
                  </div>

                  {user.role === "admin" && (
                    <>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Panel Admin
                        </div>
                      </Link>
                      <Link
                        to="/admin/auth"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                          Manajemen Pengguna
                        </div>
                      </Link>
                    </>
                  )}

                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2 2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2 2a2 2 0 012 2v2a2 2 0 01-2 2H6 2a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2 2a2 2 0 012 2v2a2 2 0 01-2 2h-2 2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                      Dashboard
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Login Button (Desktop) */}
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-[#F15A24] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Login
              </Link>
              {/* Login Icon (Mobile) */}
              <Link
                to="/login"
                className="sm:hidden inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-[#F15A24] hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7  a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden max-w-3xl w-full">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setShowVideo(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
            <div
              className="relative"
              style={{ paddingBottom: "56.25%", height: 0 }}
            >
              <iframe
                src={VIDEO_URL}
                title="Video Panduan"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
