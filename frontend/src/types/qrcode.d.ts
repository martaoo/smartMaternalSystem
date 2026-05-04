declare module "qrcode" {
  const toDataURL: (text: string, options?: any) => Promise<string>
  export { toDataURL }
  const defaultExport: {
    toDataURL: (text: string, options?: any) => Promise<string>
  }
  export default defaultExport
}
