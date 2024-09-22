export const t = (key: string) => {
  const translations: { [key: string]: string } = {
    'hero.title': 'Launch Your Solana Token',
    'hero.description':
      'Create and deploy your custom token on the Solana blockchain in minutes!',
    'hero.cta': 'Get Started',
    'form.title': 'Create Your Token (Devnet Only)',
    'form.name.label': 'Token Name',
    'form.name.placeholder': 'Enter token name',
    'form.name.tooltip': 'The name of your token (max 32 characters)',
    'form.symbol.label': 'Token Symbol',
    'form.symbol.placeholder': 'Enter token symbol',
    'form.symbol.tooltip':
      'A short identifier for your token (max 10 uppercase characters)',
    'form.imageUrl.label': 'Image URL',
    'form.imageUrl.placeholder': 'Enter image URL',
    'form.imageUrl.tooltip':
      'A URL pointing to an image representing your token',
    'form.initialSupply.label': 'Initial Supply',
    'form.initialSupply.placeholder': 'Enter initial supply',
    'form.initialSupply.tooltip': 'The initial number of tokens to mint',
    'form.decimals.label': 'Decimals',
    'form.decimals.placeholder': 'Enter number of decimals',
    'form.decimals.tooltip':
      'The number of decimal places for your token (0-9)',
    'form.submit': 'Launch Token',
    'form.submitting': 'Creating Token...',
    'error.walletNotConnected': 'Wallet not connected',
    'error.walletNotConnectedDesc':
      'Please connect your wallet to create a token.',
    'error.insufficientFunds':
      'Insufficient funds to create the token. Please check your wallet balance.',
    'error.transactionFailed':
      'Transaction simulation failed. This could be due to network congestion or an issue with the token parameters.',
    'error.generic':
      'An error occurred while creating the token. Please try again.',
    'success.tokenCreated': 'Token created successfully',
    'success.tokenCreatedDesc':
      'Your token {name} ({symbol}) has been created.',
    'preview.title': 'Token Preview',
    'transaction.success': 'Transaction Successful!',
    'transaction.viewExplorer': 'View Transaction',
    'steps.info': 'Token Creation Steps',
    'steps.prepare': 'Prepare Token Data',
    'steps.create': 'Create Token',
    'steps.mint': 'Mint Initial Supply',
    'steps.complete': 'Complete',
  }
  return translations[key] || key
}
