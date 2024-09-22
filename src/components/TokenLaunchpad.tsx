import React, { useEffect, useState, useMemo, useCallback } from 'react'
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
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Loader2,
  Rocket,
  Coins,
  Tag,
  Image as ImageIcon,
  Hash,
  Layers,
  Info,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ErrorBoundary } from 'react-error-boundary'
import { t } from '@/lib/constants'
import StepIndicator from './StepIndicator'
import TokenPreview from './TokenPreview'




const formSchema = z.object({
  name: z
    .string()
    .min(1, t('form.name.label') + ' is required')
    .max(32, t('form.name.label') + ' must be 32 characters or less'),
  symbol: z
    .string()
    .min(1, t('form.symbol.label') + ' is required')
    .max(10, t('form.symbol.label') + ' must be 10 characters or less')
    .regex(
      /^[A-Z]+$/,
      t('form.symbol.label') + ' must be uppercase letters only'
    ),
  imageUrl: z
    .string()
    .url('Invalid image URL')
    .min(1, t('form.imageUrl.label') + ' is required'),
  initialSupply: z
    .string()
    .min(1, t('form.initialSupply.label') + ' is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      t('form.initialSupply.label') + ' must be a positive number'
    ),
  decimals: z
    .string()
    .min(1, t('form.decimals.label') + ' is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 9,
      t('form.decimals.label') + ' must be between 0 and 9'
    ),
})

export type FormData = z.infer<typeof formSchema>



function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  return (
    <div
      role='alert'
      className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
    >
      <strong className='font-bold'>Oops! Something went wrong.</strong>
      <p className='mt-2'>{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className='mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'
      >
        Try again
      </button>
    </div>
  )
}



export function TokenLaunchpad() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  const watchedFields = watch()

  useEffect(() => {
    if (!wallet.connected) {
      toast.error(t('error.walletNotConnected'), {
        description: t('error.walletNotConnectedDesc'),
      })
    }
  }, [wallet.connected])

  const sanitizeUrl = useCallback((url: string) => {
    const pattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    return pattern.test(url) ? url : ''
  }, [])

  const createToken = useCallback(
    async (data: FormData) => {
      if (!wallet.publicKey) {
        toast.error(t('error.walletNotConnected'), {
          description: t('error.walletNotConnectedDesc'),
        })
        return
      }

      setIsLoading(true)
      setCurrentStep(1)
      toast.loading(t('form.submitting'), { id: 'creating-token' })

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
            ['image', sanitizeUrl(data.imageUrl)],
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

        setCurrentStep(2)
        const signature = await wallet.sendTransaction(transaction, connection)
        setTransactionSignature(signature)

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

        setCurrentStep(3)
        toast.success(t('success.tokenCreated'), {
          description: t('success.tokenCreatedDesc')
            .replace('{name}', data.name)
            .replace('{symbol}', data.symbol),
          id: 'creating-token',
        })


        reset()
        setCurrentStep(0)
      } catch (error) {
        console.error('Error creating token:', error)
        let errorMessage = t('error.generic')
        if (error instanceof Error) {
          if (error.message.includes('insufficient funds')) {
            errorMessage = t('error.insufficientFunds')
          } else if (error.message.includes('Transaction simulation failed')) {
            errorMessage = t('error.transactionFailed')
          }
        }
        toast.error(t('error.generic'), {
          description: errorMessage,
          id: 'creating-token',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [wallet, connection, sanitizeUrl, reset]
  )

  const formFields = useMemo(
    () => [
      {
        name: 'name',
        label: t('form.name.label'),
        placeholder: t('form.name.placeholder'),
        tooltip: t('form.name.tooltip'),
        icon: Coins,
      },
      {
        name: 'symbol',
        label: t('form.symbol.label'),
        placeholder: t('form.symbol.placeholder'),
        tooltip: t('form.symbol.tooltip'),
        icon: Tag,
      },
      {
        name: 'imageUrl',
        label: t('form.imageUrl.label'),
        placeholder: t('form.imageUrl.placeholder'),
        tooltip: t('form.imageUrl.tooltip'),
        icon: ImageIcon,
      },
      {
        name: 'initialSupply',
        label: t('form.initialSupply.label'),
        placeholder: t('form.initialSupply.placeholder'),
        tooltip: t('form.initialSupply.tooltip'),
        icon: Layers,
      },
      {
        name: 'decimals',
        label: t('form.decimals.label'),
        placeholder: t('form.decimals.placeholder'),
        tooltip: t('form.decimals.tooltip'),
        icon: Hash,
      },
    ],
    []
  )

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <TooltipProvider delayDuration={0}>
        <section className='py-10 md:py-20 text-center text-black bg-yellow-300 relative overflow-hidden'>
          <div className='container mx-auto relative z-10 px-4'>
            <motion.h2
              className='text-4xl md:text-6xl font-bold mb-4'
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {t('hero.title')}
            </motion.h2>
            <motion.p
              className='text-xl md:text-2xl mb-8'
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {t('hero.description')}
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
              {t('hero.cta')}
            </motion.a>
          </div>
        </section>
        <section id='create-token' className='py-10 md:py-20 bg-blue-300'>
          <div className='container mx-auto px-4'>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className='bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 max-w-2xl mx-auto'
            >
              <h3 className='text-3xl md:text-4xl font-bold mb-8 text-center text-black'>
                {t('form.title')}
              </h3>

              <StepIndicator currentStep={currentStep} />

              <form
                onSubmit={handleSubmit(createToken)}
                className='grid grid-cols-1 md:grid-cols-2 gap-6'
              >
                <AnimatePresence>
                  {formFields.map((field) => (
                    <motion.div
                      key={field.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label
                        htmlFor={field.name}
                        className='block text-lg font-bold mb-2 text-black'
                      >
                        <field.icon
                          className='inline-block mr-2 h-5 w-5'
                          aria-hidden='true'
                        />
                        {field.label}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info
                              className='inline-block ml-1 h-4 w-4 cursor-help'
                              aria-label={`Info about ${field.label}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{field.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </label>
                      <input
                        id={field.name}
                        type={
                          field.name === 'imageUrl'
                            ? 'url'
                            : field.name === 'initialSupply' ||
                              field.name === 'decimals'
                            ? 'number'
                            : 'text'
                        }
                        placeholder={field.placeholder}
                        {...register(field.name as keyof FormData)}
                        className='w-full p-3 border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300'
                        aria-label={field.label}
                        aria-invalid={
                          errors[field.name as keyof FormData]
                            ? 'true'
                            : 'false'
                        }
                      />
                      {errors[field.name as keyof FormData] && (
                        <p className='text-red-500 mt-1' role='alert'>
                          {errors[field.name as keyof FormData]?.message}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div className='md:col-span-2'>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type='submit'
                    disabled={!wallet.connected || isLoading}
                    className='w-full mt-8 bg-black text-yellow-300 font-bold py-4 px-4 rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-300 flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed'
                    aria-label={
                      isLoading ? t('form.submitting') : t('form.submit')
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2
                          className='mr-2 h-6 w-6 animate-spin'
                          aria-hidden='true'
                        />
                        {t('form.submitting')}
                      </>
                    ) : (
                      <>
                        <Rocket className='mr-2 h-6 w-6' aria-hidden='true' />
                        {t('form.submit')}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
              <motion.div
                className='mt-8'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <TokenPreview {...watchedFields} />
              </motion.div>

              {transactionSignature && (
                <motion.div
                  className='mt-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h4 className='font-bold mb-2'>{t('transaction.success')}</h4>
                  <p>
                    Your token has been created. View the transaction on Solana
                    Explorer:
                  </p>
                  <a
                    href={`https://explorer.solana.com/tx/${transactionSignature}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-500 hover:text-blue-700 underline flex items-center mt-2'
                  >
                    {t('transaction.viewExplorer')}{' '}
                    <ExternalLink className='ml-1 h-4 w-4' aria-hidden='true' />
                  </a>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </TooltipProvider>
    </ErrorBoundary>
  )
}
