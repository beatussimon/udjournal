import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-udsm-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-4">UDSM JOURNALS</h3>
            <p className="text-sm text-gray-400">
              The University of Dar es Salaam Institutional Repository provides open access to
              scholarly research and publications from UDSM academics.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/journals" className="hover:text-udsm-gold transition-colors">Journals</Link></li>
              <li><Link to="/search" className="hover:text-udsm-gold transition-colors">Search</Link></li>
              <li><Link to="/submission" className="hover:text-udsm-gold transition-colors">Submit</Link></li>
              <li><Link to="/analytics" className="hover:text-udsm-gold transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-udsm-gold transition-colors">Author Guidelines</a></li>
              <li><a href="#" className="hover:text-udsm-gold transition-colors">Peer Review Process</a></li>
              <li><a href="#" className="hover:text-udsm-gold transition-colors">Open Access Policy</a></li>
              <li><a href="#" className="hover:text-udsm-gold transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>University of Dar es Salaam</li>
              <li>P.O. Box 35091</li>
              <li>Dar es Salaam, Tanzania</li>
              <li className="pt-2">
                <a href="mailto:commons@udsm.ac.tz" className="hover:text-udsm-gold transition-colors">
                  commons@udsm.ac.tz
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} UDSM JOURNALS. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <a href="#" className="hover:text-udsm-gold transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-udsm-gold transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-udsm-gold transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
