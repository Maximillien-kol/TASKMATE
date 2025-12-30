
import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-10 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center">
              <Image src="/favicon.svg" alt="TaskMaster Logo" width={36} height={36} className="w-9 h-9" />
            </div>
            <span className="text-xl font-medium text-slate-900 tracking-tight">TaskMaster</span>
          </div>
          {/* Sign Up Button
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-semibold text-slate-500">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
          */}
          <p className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} TaskMaster Inc.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
