import ProductReviews from '@/component/product-reviews'
import { josefin } from '@/utils/font'
import React from 'react'

const ProductReviewsPage = () => {
  return (
    <div>
      <h1 className={`text-4xl text-primaryColor ${josefin.className}`}>Product Reviews</h1>
      <div><ProductReviews /></div>
    </div>
  )
}

export default ProductReviewsPage

