
import {
  ShoppingBag,
  Package,
  LogIn,
  ShoppingCart,
} from 'lucide-react'

import { NavLink } from 'react-router-dom'
import Button from '../ui/Button'

const Header = ({ cartCount, onCartClick }) => {

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4">
        <a
          href="/"
          className="text-xl font-bold tracking-tight text-slate-900"
        >
          Market<span className="text-indigo-600">Place</span>
        </a>

        <nav className="flex items-center gap-2 sm:gap-3">
          <NavLink
            to="/"
            end
            aria-label="Products"
            className={({ isActive }) =>
              `flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium transition-colors hover:bg-slate-50 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5 ${isActive
                ? 'text-indigo-600'
                : 'text-slate-600 hover:text-indigo-600'
              }`
            }
          >
            <ShoppingBag size={20} className="sm:hidden" />

            <span className="hidden sm:inline">
              Products
            </span>
          </NavLink>

          <NavLink
            to="/orders"
            aria-label="My Orders"
            className={({ isActive }) =>
              `flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-medium transition-colors hover:bg-slate-50 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5 ${isActive
                ? 'text-indigo-600'
                : 'text-slate-600 hover:text-indigo-600'
              }`
            }
          >
            <Package size={20} className="sm:hidden" />

            <span className="hidden sm:inline">
              My Orders
            </span>
          </NavLink>

          <Button
            onClick={onCartClick}
            aria-label={`Cart with ${cartCount} items`}
            className="h-11 w-11 shrink-0 rounded-lg p-0 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
          >
            <ShoppingCart size={20} className="sm:hidden" />

            <span className="hidden sm:inline">
              Cart ({cartCount})
            </span>
          </Button>

          <Button
            variant="secondary"
            aria-label="Sign In"
            className="h-11 w-11 shrink-0 rounded-lg p-0 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
          >
            <LogIn size={20} className="sm:hidden" />

            <span className="hidden sm:inline">
              Sign In
            </span>
          </Button>
        </nav>
      </div>
    </header>
  )
}

export default Header
