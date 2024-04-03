import React, { createContext, useState } from 'react'

export const UserContext = createContext<{
  modelComplexity: 0 | 2 | 1
  setModelComplexity: (newValue: any) => void
  camera: string
  setCamera: (newValue) => void
  postureStrictness: string
  setPostureStrictness: (newValue) => void
}>({
  modelComplexity: 1,
  setModelComplexity: () => undefined,
  camera: '',
  setCamera: () => undefined,
  postureStrictness: '',
  setPostureStrictness: () => undefined
})

export const UserProvider: React.FC<any> = ({ children }) => {
  const savedSettingsChecker = (key: string, defaultValue: any) => {
    const item = localStorage.getItem(key)
    if (item) {
      try {
        return JSON.parse(item)
      } catch {
        return defaultValue
      }
    }
    return defaultValue
  }

  const [modelComplexity, setModelComplexity] = useState(savedSettingsChecker('modelComplexity', 2))
  const [camera, setCamera] = useState(savedSettingsChecker('camera', ''))
  const [postureStrictness, setPostureStrictness] = useState(
    savedSettingsChecker('postureStrictness', '1')
  )
  return (
    <UserContext.Provider
      value={{
        modelComplexity,
        setModelComplexity,
        camera,
        setCamera,
        postureStrictness,
        setPostureStrictness
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
