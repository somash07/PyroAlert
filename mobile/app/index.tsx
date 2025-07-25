"use client"

import { useRouter } from "expo-router"
import { useEffect } from "react"
import { ActivityIndicator, View } from "react-native"
import { PRIMARY_COLOR } from "../constants/constants"
import { useAuth } from "../contexts/AuthContext"

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard")
      } else {
        router.replace("/login")
      }
    }
  }, [isAuthenticated, isLoading])

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={PRIMARY_COLOR} />
    </View>
  )
}
