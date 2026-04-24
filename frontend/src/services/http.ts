import axios from "axios"

export const http = axios.create({
  baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
})

