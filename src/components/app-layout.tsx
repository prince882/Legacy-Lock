import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AppHeader } from '@/components/app-header'
import React from 'react'
import { ClusterChecker, WalletChecker } from '@/components/cluster/cluster-ui'
import { AccountChecker } from '@/components/account/account-ui'
import { BackgroundEffect } from './ts-particles/bg-effect'
// import { GlobalLoadingIndicator } from './LegacyLock/isFetching'

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-900/20 via-black/5  to-cyan-900/10" >
        <AppHeader links={links} />
        <main className="flex-grow container mx-auto p-4">
          <ClusterChecker>
            <AccountChecker />
          </ClusterChecker>
          <WalletChecker>
            {children}
          </WalletChecker>
        </main>
      </div>
      <Toaster />
      <BackgroundEffect />
    </ThemeProvider>
  )
}
