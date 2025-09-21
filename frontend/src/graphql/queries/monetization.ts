import { gql } from '@apollo/client';

export const CHECK_MONETIZATION_ELIGIBILITY_QUERY = gql`
  query CheckMonetizationEligibility {
    checkMonetizationEligibility {
      eligible
      followersCount
      viewsCount
      requirements {
        minFollowers
        minViews
        periodDays
        minVideoDuration
      }
    }
  }
`;

export const REQUEST_MONETIZATION_MUTATION = gql`
  mutation RequestMonetization {
    requestMonetization {
      success
      message
    }
  }
`;

export const GET_AD_REVENUE_QUERY = gql`
  query GetAdRevenue($period: String) {
    getAdRevenue(period: $period) {
      revenues {
        id
        amount
        currency
        period
        impressions
        clicks
        cpm
        ctr
        createdAt
        paidAt
      }
      totalAmount
      totalImpressions
      totalClicks
      averageCTR
    }
  }
`;

export const GET_MONETIZATION_REQUESTS_QUERY = gql`
  query GetMonetizationRequests($skip: Int, $take: Int, $status: String) {
    getMonetizationRequests(skip: $skip, take: $take, status: $status) {
      requests {
        id
        userId
        status
        reason
        followersCount
        viewsCount
        createdAt
        reviewedAt
        user {
          id
          username
          firstName
          lastName
          email
          avatar
          verified
          followersCount
          postsCount
          createdAt
        }
      }
      total
      hasMore
    }
  }
`;

export const REVIEW_MONETIZATION_REQUEST_MUTATION = gql`
  mutation ReviewMonetizationRequest($input: ReviewMonetizationInput!) {
    reviewMonetizationRequest(input: $input) {
      success
      message
    }
  }
`;

export const GET_MONETIZATION_STATS_QUERY = gql`
  query GetMonetizationStats {
    getMonetizationStats {
      totalRequests
      pendingRequests
      approvedUsers
      totalRevenue
      approvalRate
    }
  }
`;
