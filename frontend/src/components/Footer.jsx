const Footer = () => {
  return (
    <footer className="bg-modex-dark text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">MODEX Academy</h3>
            <p className="text-gray-300">
              Empowering financial excellence through competition and innovation.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-modex-teal transition-colors">Home</a></li>
              <li><a href="/competition" className="hover:text-modex-teal transition-colors">Competition</a></li>
              <li><a href="/about" className="hover:text-modex-teal transition-colors">About</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-gray-300">
              For inquiries, please contact us through the platform.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-400">
          <p>&copy; 2024 MODEX Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

