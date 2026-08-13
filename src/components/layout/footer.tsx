export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white py-4 px-6">
      <div className="text-sm text-gray-500 text-center md:text-left">
        &copy; {new Date().getFullYear()} PAWARTA Enterprise. All rights reserved.
      </div>
    </footer>
  );
}
