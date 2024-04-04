import React from 'react'
import { useState, useEffect, useContext } from 'react'
import { UserContext } from '@renderer/contexts/User'
import { Select, MenuItem, Button, Typography } from '@mui/material'

const Settings: React.FC = () => {
  const { modelComplexity, setModelComplexity } = useContext(UserContext)
  const { camera, setCamera } = useContext(UserContext)
  const { postureStrictness, setPostureStrictness } = useContext(UserContext)
  const [cameras, setCameras] = useState<string[]>([])
  const [cameraRefresh, setCameraRefresh] = useState<boolean>()

  let cameraDevices: string[] = []
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      cameraDevices = []
      devices.forEach((device) => {
        if (device.kind === 'videoinput') {
          cameraDevices.push(device.label)
        }
      })
      setCameras(cameraDevices)
      if (!camera) {
        setCamera(cameraDevices[0])
      }
      setCameraRefresh(false)
    })
  }, [cameraRefresh])
  function reloadCamera(): void {
    setCameraRefresh(true)
  }
  if (!cameraDevices) {
    return <p>Please connect a camera device</p>
  }
  function handleChange(event): void {
    setModelComplexity(Number(event.target.value))
    localStorage.setItem('modelComplexity', JSON.stringify(event.target.value))
  }
  
  function handlePostureChange(event): void {
    setPostureStrictness(event.target.value)
    localStorage.setItem('postureStrictness', JSON.stringify(event.target.value))
  }

  return (
    <div>
      <Typography
        variant="h6"
        component="div"
        sx={{
          flexGrow: 1,
          textAlign: 'left',
          paddingLeft: '5%',
          marginTop: '20px',
          fontWeight: 'bold',
          color: 'black',
          fontSize: '1.7rem'
        }}
      >
        Settings
      </Typography>
      <div
        style={{
          justifyContent: 'center',
          paddingLeft: '5%',
          paddingTop: '5%',
          width: '90%'
        }}
      >
        <label>Model Performance </label>
        <br></br>
        <br></br>
        <Select
          value={modelComplexity}
          onChange={handleChange}
          style={{ minWidth: '150px' }}
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem key="0" value={0}>
            Lite
          </MenuItem>
          <MenuItem key="1" value={1}>
            Full
          </MenuItem>
          <MenuItem key="2" value={2}>
            Heavy
          </MenuItem>
        </Select>
        <br />
        <br />
        <br>
        </br>
        <br></br>
        <label>Posture Strictness&nbsp;&nbsp;&nbsp; </label>
        <br></br>
        <br></br>
        <Select
          value={postureStrictness}
          onChange={handlePostureChange}
          style={{ minWidth: '150px' }}
          inputProps={{ 'aria-label': 'Without label' }}
        >
          <MenuItem value="1.5">Low</MenuItem>
          <MenuItem value="1">Medium</MenuItem>
          <MenuItem value="0.5">High</MenuItem>
        </Select>
      </div>
    </div>
  )
}

export default Settings
