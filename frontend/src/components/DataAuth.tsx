import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

type User = {
  _id: string;
  username: string;
  role: "user" | "admin";
};

export default function DataAuth() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error(
            "Token tidak ditemukan. Silakan login terlebih dahulu."
          );
        }

        const res = await fetch("http://localhost:3000/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Gagal mengambil data pengguna");
        }

        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error("Gagal mengambil data pengguna", err);
        Swal.fire({
          icon: "error",
          title: "Kesalahan",
          text: err.message || "Gagal memuat data pengguna",
          confirmButtonColor: "#F15A24",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Tambah Pengguna Baru",
      html:
        `<input id="swal-username" class="swal2-input" placeholder="Username">` +
        `<input id="swal-password" type="password" class="swal2-input" placeholder="Password">` +
        `<select id="swal-role" class="swal2-select">
        <option value="user">Pengguna</option>
        <option value="admin">Admin</option>
      </select>`,
      focusConfirm: false,
      preConfirm: () => {
        const username = (
          document.getElementById("swal-username") as HTMLInputElement
        ).value;
        const password = (
          document.getElementById("swal-password") as HTMLInputElement
        ).value;
        const role = (document.getElementById("swal-role") as HTMLSelectElement)
          .value;

        if (!username || !password) {
          Swal.showValidationMessage("Semua field harus diisi!");
          return;
        }

        return { username, password, role };
      },
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#F15A24",
      cancelButtonColor: "#6B7280",
    });

    if (formValues) {
      try {
        const res = await fetch("http://localhost:3000/auth/register", {
          method: "POST",
          headers: getTokenHeader(),
          body: JSON.stringify(formValues),
        });

        if (!res.ok) throw new Error("Gagal menambahkan pengguna");

        const newUser = await res.json();
        setUsers((prev) => [...prev, newUser]);

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Pengguna berhasil ditambahkan",
          confirmButtonColor: "#F15A24",
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Tidak dapat menambahkan pengguna baru",
          confirmButtonColor: "#F15A24",
        });
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTokenHeader = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleChangePassword = async (userId: string) => {
    const { value: newPassword } = await Swal.fire({
      title: "Ubah Kata Sandi",
      input: "password",
      inputLabel: "Kata Sandi Baru",
      inputPlaceholder: "Masukkan kata sandi baru (min 6 karakter)",
      inputAttributes: {
        minlength: "6",
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
      confirmButtonColor: "#F15A24",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Perbarui",
      cancelButtonText: "Batal",
    });

    if (newPassword) {
      try {
        const res = await fetch(
          `http://localhost:3000/users/${userId}/password`,
          {
            method: "PUT",
            headers: getTokenHeader(),
            body: JSON.stringify({ password: newPassword }),
          }
        );

        if (!res.ok) throw new Error("Gagal memperbarui kata sandi");

        Swal.fire({
          icon: "success",
          title: "Berhasil Diperbarui",
          text: "Kata sandi berhasil diperbarui",
          confirmButtonColor: "#F15A24",
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Gagal Memperbarui",
          text: "Gagal mengubah kata sandi",
          confirmButtonColor: "#F15A24",
        });
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Hapus pengguna ini?",
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F15A24",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "DELETE",
        headers: getTokenHeader(),
      });

      if (!res.ok) throw new Error("Gagal menghapus pengguna");

      setUsers((prev) => prev.filter((user) => user._id !== userId));

      Swal.fire({
        icon: "success",
        title: "Berhasil Dihapus!",
        text: "Pengguna telah dihapus.",
        confirmButtonColor: "#F15A24",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Kesalahan",
        text: "Gagal menghapus pengguna",
        confirmButtonColor: "#F15A24",
      });
    }
  };

  const handleChangeRole = async (
    userId: string,
    currentRole: "user" | "admin"
  ) => {
    const newRole = currentRole === "user" ? "admin" : "user";

    try {
      const res = await fetch(`http://localhost:3000/users/${userId}/role`, {
        method: "PUT",
        headers: getTokenHeader(),
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui peran");

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );

      Swal.fire({
        icon: "success",
        title: "Peran Diperbarui",
        text: `Peran pengguna diubah menjadi ${newRole}`,
        confirmButtonColor: "#F15A24",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Memperbarui",
        text: "Gagal mengubah peran pengguna",
        confirmButtonColor: "#F15A24",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Manajemen Akun Pengguna
          </h1>
          <p className="text-gray-500">
            Kelola semua akun pengguna yang terdaftar
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari pengguna..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F15A24] focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-transparent text-white bg-[#F15A24] hover:bg-orange-700 transition-colors shadow-sm"
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
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Tambah Pengguna
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Beranda
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#F15A24] border-r-transparent"></div>
            <span className="text-gray-500">Memuat pengguna...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-700">
                Pengguna tidak ditemukan
              </h3>
              <p className="mt-1 text-gray-500">
                Coba ubah kata kunci pencarian atau filter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peran
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                          onClick={() => handleChangeRole(user._id, user.role)}
                        >
                          {user.role === "admin" ? "Admin" : "Pengguna"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleChangePassword(user._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-[#F15A24] hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
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
                          Ubah Kata Sandi
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
