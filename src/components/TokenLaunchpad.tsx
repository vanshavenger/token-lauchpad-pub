'use client'

import { useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Keypair, SystemProgram, Transaction } from '@solana/web3.js'
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  getMintLen,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
} from '@solana/spl-token'
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
  TokenMetadata,
} from '@solana/spl-token-metadata'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Loader2, Rocket, Coins, Tag, Image, Hash, Layers } from 'lucide-react'
import { useForm } from 'react-hook-form'

type FormData = {
  name: string
  symbol: string
  imageUrl: string
  initialSupply: string
  decimals: string
}

export function TokenLaunchpad() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()

  useEffect(() => {
    if (!wallet.connected) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to create a token.',
      })
    }
  }, [wallet.connected])

  const onSubmit = async (data: FormData) => {
    if (!wallet.publicKey) {
      toast.error('Wallet not connected', {
        description: 'Please connect your wallet to create a token.',
      })
      return
    }

    toast.loading('Creating token...', { id: 'creating-token' })

    try {
      const keypair = Keypair.generate()

      const metadata: TokenMetadata = {
        updateAuthority: wallet.publicKey,
        mint: keypair.publicKey,
        name: data.name,
        symbol: data.symbol,
        uri: 'https://www.dsandev.in/api/token',
        additionalMetadata: [
          ['description', 'Only Possible On Solana'],
          ['image', data.imageUrl],
        ],
      }

      const mintLen = getMintLen([ExtensionType.MetadataPointer])
      const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length

      const lamports = await connection.getMinimumBalanceForRentExemption(
        mintLen + metadataLen
      )

      const transaction = new Transaction()

      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: keypair.publicKey,
          space: mintLen,
          lamports,
          programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
          keypair.publicKey,
          wallet.publicKey,
          keypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeMintInstruction(
          keypair.publicKey,
          parseInt(data.decimals),
          wallet.publicKey,
          wallet.publicKey,
          TOKEN_2022_PROGRAM_ID
        ),
        createInitializeInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          mint: keypair.publicKey,
          metadata: keypair.publicKey,
          updateAuthority: wallet.publicKey,
          mintAuthority: wallet.publicKey,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
        }),
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: keypair.publicKey,
          updateAuthority: wallet.publicKey,
          field: metadata.additionalMetadata[1][0],
          value: metadata.additionalMetadata[1][1],
        })
      )

      const recentBlockhash = await connection.getLatestBlockhashAndContext()
      transaction.recentBlockhash = recentBlockhash.value.blockhash
      transaction.feePayer = wallet.publicKey

      transaction.partialSign(keypair)

      const response = await wallet.sendTransaction(transaction, connection)

      const associatedToken = getAssociatedTokenAddressSync(
        keypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      )

      const transaction2 = new Transaction()

      transaction2.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedToken,
          wallet.publicKey,
          keypair.publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      )

      await wallet.sendTransaction(transaction2, connection)

      const transaction3 = new Transaction()

      transaction3.add(
        createMintToInstruction(
          keypair.publicKey,
          associatedToken,
          wallet.publicKey,
          parseFloat(data.initialSupply) * 10 ** parseInt(data.decimals),
          [],
          TOKEN_2022_PROGRAM_ID
        )
      )

      await wallet.sendTransaction(transaction3, connection)

      toast.success('Token created successfully', {
        description: `Your token ${data.name} (${data.symbol}) has been created.`,
        id: 'creating-token',
      })
    } catch (error) {
      console.error('Error creating token:', error)
      toast.error('Error creating token', {
        description:
          'An error occurred while creating the token. Please try again.',
        id: 'creating-token',
      })
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className='py-20 text-center text-black bg-yellow-300 relative overflow-hidden'>
        <div className='container mx-auto relative z-10'>
          <motion.h2
            className='text-6xl font-bold mb-4'
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Launch Your Solana Token
          </motion.h2>
          <motion.p
            className='text-2xl mb-8'
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Create and deploy your custom token on the Solana blockchain in
            minutes!
          </motion.p>
          <motion.a
            href='#create-token'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='inline-block bg-black text-yellow-300 font-bold text-lg py-4 px-8 rounded-none border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-300'
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Get Started
          </motion.a>
        </div>
      </section>

      {/* Token Creation Form */}
      <section id='create-token' className='py-20 bg-blue-300'>
        <div className='container mx-auto'>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-2xl mx-auto'
          >
            <h3 className='text-4xl font-bold mb-8 text-center text-black'>
              Create Your Token
            </h3>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='grid grid-cols-1 md:grid-cols-2 gap-6'
            >
              <div>
                <label
                  htmlFor='name'
                  className='block text-lg font-bold mb-2 text-black'
                >
                  <Coins className='inline-block mr-2 h-5 w-5' />
                  Token Name
                </label>
                <input
                  id='name'
                  type='text'
                  placeholder='Enter token name'
                  {...register('name', { required: 'Token name is required' })}
                  className='w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300'
                  aria-label='Token Name'
                />
                {errors.name && (
                  <p className='text-red-500 mt-1'>{errors.name.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='symbol'
                  className='block text-lg font-bold mb-2 text-black'
                >
                  <Tag className='inline-block mr-2 h-5 w-5' />
                  Token Symbol
                </label>
                <input
                  id='symbol'
                  type='text'
                  placeholder='Enter token symbol'
                  {...register('symbol', {
                    required: 'Token symbol is required',
                  })}
                  className='w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300'
                  aria-label='Token Symbol'
                />
                {errors.symbol && (
                  <p className='text-red-500 mt-1'>{errors.symbol.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='imageUrl'
                  className='block text-lg font-bold mb-2 text-black'
                >
                  <Image className='inline-block mr-2 h-5 w-5' />
                  Image URL
                </label>
                <input
                  id='imageUrl'
                  type='url'
                  placeholder='Enter image URL'
                  {...register('imageUrl', {
                    required: 'Image URL is required',
                  })}
                  className='w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300'
                  aria-label='Image URL'
                />
                {errors.imageUrl && (
                  <p className='text-red-500 mt-1'>{errors.imageUrl.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor='initialSupply'
                  className='block text-lg font-bold mb-2 text-black'
                >
                  <Layers className='inline-block mr-2 h-5 w-5' />
                  Initial Supply
                </label>
                <input
                  id='initialSupply'
                  type='number'
                  placeholder='Enter initial supply'
                  {...register('initialSupply', {
                    required: 'Initial supply is required',
                  })}
                  className='w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300'
                  aria-label='Initial Supply'
                />
                {errors.initialSupply && (
                  <p className='text-red-500 mt-1'>
                    {errors.initialSupply.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor='decimals'
                  className='block text-lg font-bold mb-2 text-black'
                >
                  <Hash className='inline-block mr-2 h-5 w-5' />
                  Decimals
                </label>
                <input
                  id='decimals'
                  type='number'
                  placeholder='Enter number of decimals'
                  {...register('decimals', {
                    required: 'Number of decimals is required',
                  })}
                  className='w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300'
                  aria-label='Decimals'
                />
                {errors.decimals && (
                  <p className='text-red-500 mt-1'>{errors.decimals.message}</p>
                )}
              </div>
              <div className='md:col-span-2'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type='submit'
                  disabled={!wallet.connected}
                  className='w-full mt-8 bg-black text-yellow-300 font-bold py-4 px-4 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-300 flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Rocket className='mr-2 h-6 w-6' />
                  Launch Token
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </>
  )
}
