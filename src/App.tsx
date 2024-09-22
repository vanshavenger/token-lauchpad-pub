import './App.css'
import { TokenLaunchpad } from './components/TokenLaunchpad'
import { Toaster } from 'sonner'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { Github } from 'lucide-react'

function App() {
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL

  return (
    <ConnectionProvider endpoint={rpcUrl}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <div className='min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500'>
            <Toaster position='top-center' closeButton duration={3000} visibleToasts={2} richColors />

            {/* Navbar */}
            <nav className='bg-white border-b-4 border-black p-4'>
              <div className='container mx-auto flex justify-between items-center'>
                <h1 className='text-2xl font-bold'>Solana Token Launchpad</h1>
                <WalletMultiButton className='!bg-black !text-white !font-bold !py-2 !px-4 !rounded-full !border-2 !border-white hover:!bg-white hover:!text-black !transition-all !duration-300' />
              </div>
            </nav>

            {/* Main Content */}
            <main>
              <TokenLaunchpad />
            </main>

            {/* Footer */}
            <footer className='bg-black text-white py-8'>
              <div className='container mx-auto text-center'>
                <p className='mb-4'>
                  &copy; {new Date().getFullYear()} Vansh Choopa. All rights
                  reserved.
                </p>
                <a
                  href='https://github.com/vanshavenger'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center text-white hover:text-purple-400 transition-colors duration-300'
                >
                  <Github className='mr-2 h-5 w-5' />
                  GitHub
                </a>
              </div>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
