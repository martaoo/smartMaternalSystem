import { http } from "./http"

export async function uploadReferralDoc(referralId: string, file: File) {
  const form = new FormData()
  form.append("file", file)
  form.append("referralId", referralId)

  const { data } = await http.post("/files/upload-referral-doc", form, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return data as { message: string; url: string }
}

