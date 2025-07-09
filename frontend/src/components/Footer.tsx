export default function Footer() {
  return (
    <footer className="bg-[#2C2F4A] text-white py-8 md:py-10 border-t border-gray-700">
      <div className="container mx-auto px-4">
        <div className=" border-gray-700 text-center text-xs opacity-75">
          <p>
            © {new Date().getFullYear()} BPBD Kabupaten Pidie Jaya. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
