import React from "react"
import { FormData } from "./TokenLaunchpad"
import { t } from "@/lib/constants"

const TokenPreview = React.memo(
  ({ name, symbol, imageUrl }: Partial<FormData>) => {
    return (
      <div className='bg-white p-4 rounded-lg shadow-md'>
        <h4 className='text-lg font-bold mb-2'>{t('preview.title')}</h4>
        <div className='flex items-center space-x-4'>
          {imageUrl && (
            <img
              src={imageUrl}
              alt='Token'
              className='w-16 h-16 rounded-full object-cover'
            />
          )}
          <div>
            <p className='font-semibold'>{name || 'Token Name'}</p>
            <p className='text-sm text-gray-600'>{symbol || 'SYM'}</p>
          </div>
        </div>
      </div>
    )
  }
)

TokenPreview.displayName = 'TokenPreview'

export default TokenPreview