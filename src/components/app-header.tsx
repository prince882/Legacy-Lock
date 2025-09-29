import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, Shield, X } from 'lucide-react'
import { ThemeSelect } from '@/components/theme-select'
import { ClusterUiSelect } from './cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'
import { Link, useLocation } from 'react-router'

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const { pathname } = useLocation()
  const [showMenu, setShowMenu] = useState(false)

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header className="relative h-16 bg-black/20 border-b border-gray-800 backdrop-blur-md z-50 transition-all duration-500 hover:shadow-[0_0_4px_#00ffff,0_0_8px_#ff00ff] hover:border-cyan-400">
      <div className="mx-auto flex justify-between  items-center">
        <div className="flex items-center justify-center gap-2.5">
          <Link to="/" className="text-xl flex gap-3 m-3 hover:text-neutral-500 dark:hover:text-white">
            <span className=' flex flex-row justify-center items-center text-[21px] hover:scale-110 mb-3 font-bold text-gray-300  drop-shadow-[0_0_6px_rgba(180,180,180,0.6)]  hover:drop-shadow-[0_0_12px_rgba(200,200,200,0.9)]  transition-all duration-300'>
              <div className="inline-flex mr-2 items-center justify-center w-9 h-9 hover:scale-110 transition-all duration-300  bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl  shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                <Shield className="w-6 h-6 text-white" />
              </div>
              LegacyLock</span>
          </Link>
          <div className="hidden md:flex mb-2.5 items-center ">
            <ul className="flex gap-4 flex-nowrap  items-center">
              {links.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    className={`hover:text-neutral-500 text-lg  hover:scale-110 ${isActive(path) ? ' font-bold scale-130 text-blue-500 ' : ''}`}
                    to={path}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setShowMenu(!showMenu)}>
          {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
        <div className="hidden z-50 mr-3 md:flex items-center mb-3.5  gap-4">
          <ClusterUiSelect />
          <div>
            <WalletButton/>
          </div>
          <ThemeSelect />
        </div>
        {showMenu && (
          <div className="md:hidden z-20 fixed inset-x-0 top-[52px] bottom-0 bg-neutral-100/95 dark:bg-neutral-900/95 backdrop-blur-sm">
            <div className="flex flex-col p-4 gap-4 border-t dark:border-neutral-800">
              <ul className="flex flex-col gap-4">
                {links.map(({ label, path }) => (
                  <li key={path}>
                    <Link
                      className={`hover:text-neutral-500 dark:hover:text-white block text-lg py-2  ${isActive(path) ? 'text-neutral-500 dark:text-white' : ''} `}
                      to={path}
                      onClick={() => setShowMenu(false)}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex z-50  flex-col gap-4">
                <WalletButton />
                <ClusterUiSelect />
                <ThemeSelect />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
