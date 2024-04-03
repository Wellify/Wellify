import React, { useContext } from 'react'
import Button from '@mui/material/Button'
import { useRef, useEffect, useState } from 'react'
import Slouch from './Posture/Slouch'
import LookAway from './Posture/LookAway'
import { UserContext } from '@renderer/contexts/User'
import EyeDistance from './Posture/EyeDistance'
import { CircularProgress, Typography } from '@mui/material'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PostureDetection: React.FC<any> = ({ webcamRef }) => {
  console.log(window)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  let camera = null
  const { modelComplexity } = useContext(UserContext)

  const [postureData, setPostureData] = useState(null)
  const [startPosition, setStartPosition] = useState(null)
  const [sessionRunning, setSessionRunning] = useState(false)
  const [slouchCount, setSlouchCount] = useState(0)
  const [notLookedAwayCount, setNotLookedAwayCount] = useState(0)
  const [tooCloseCount, setTooCloseCount] = useState(0)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionStarting, setSessionStarting] = useState(false)
  const [progress, setProgress] = React.useState(0)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onResults(results) {
    if (isLoading) {
      setIsLoading(false)
    }
    setPostureData(results)
    const canvasElement = canvasRef.current
    if (!canvasElement) return

    const canvasCtx = canvasElement.getContext('2d')
    if (!canvasCtx) return

    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height)

    if (results.poseLandmarks) {
      window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, {
        visibilityMin: 0.65,
        color: 'white'
      })
      window.drawLandmarks(
        canvasCtx,
        Object.values(window.POSE_LANDMARKS_LEFT).map((index) => results.poseLandmarks[index]),
        { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(0,100,197)' }
      )
      window.drawLandmarks(
        canvasCtx,
        Object.values(window.POSE_LANDMARKS_RIGHT).map((index) => results.poseLandmarks[index]),
        { visibilityMin: 0.65, color: 'white', fillColor: 'rgb(137,201,251)' }
      )
      window.drawLandmarks(
        canvasCtx,
        Object.values(window.POSE_LANDMARKS_NEUTRAL).map((index) => results.poseLandmarks[index]),
        { visibilityMin: 0.65, color: 'white', fillColor: 'white' }
      )
    }
    canvasCtx.restore()
  }

  useEffect(() => {
    if (typeof Pose === 'undefined' || typeof Camera === 'undefined') {
      console.error('MediaPipe libraries are not loaded.')
      return
    }

    if (!hasLoaded) {
      const mpPose = new window.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      })
      mpPose.setOptions({
        selfieMode: true,
        modelComplexity: 2,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      if (webcamRef.current && canvasRef.current) {
        camera = new window.Camera(webcamRef.current, {
          onFrame: async () => {
            await mpPose.send({ image: webcamRef.current })
          }
        })

        camera
          .start()
          .then(() => {
            setHasLoaded(true)
          })
          .catch((error) => {
            console.error('Camera error:', error)
          })

        mpPose.onResults(onResults)
      }
    }

    return () => {
      if (camera) camera.stop()
    }
  }, [hasLoaded, modelComplexity, webcamRef.current, canvasRef.current])

  const handleClick = (): void => {
    if (!sessionRunning) {
      setSessionStarting(true)
      setSessionRunning(true)
      setTimeout(() => {
        console.log('session started')
        setStartPosition(postureData)
        setSessionStarting(false)
      }, 3000)
    } else {
      setSessionRunning(false)
      setStartPosition(null)
      setSlouchCount(0)
      setNotLookedAwayCount(0)
      console.log('session stopped')
      camera?.stop()
    }
  }
  return (
    <>
      <div style={{ width: '640px', height: '480px', position: 'relative' }}>
        {isLoading ? (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 30,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 100, 197, 0.7)'
            }}
          >
            <CircularProgress size={80} sx={{ color: '#89c9fb' }} />
          </div>
        ) : null}
        {sessionStarting ? (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              zIndex: 50,
              backgroundColor: 'rgba(0, 100, 197, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: 'white',
                fontSize: '1.7rem',
                fontWeight: 'bolder',
                textAlign: 'center',
                marginBottom: 4
              }}
            >
              Please make sure to sit up straight...
            </Typography>
            <CircularProgress size={80} sx={{ color: '#89c9fb' }} />
          </div>
        ) : null}
        <video
          ref={webcamRef}
          muted
          autoPlay
          playsInline
          style={{
            position: 'absolute',
            width: '640px',
            height: '480px',
            zIndex: 10,
            transform: 'scaleX(-1)'
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 20,
            width: '640px',
            height: '480px',
            display: isLoading ? 'none' : 'block'
          }}
        />
      </div>

      {isLoading ? null : (
        <Button
          variant="contained"
          style={{
            position: 'absolute',
            marginTop: '55px',
            marginLeft: '250px'
          }}
          sx={{
            bgcolor: '#0064C5',
            '&:hover': {
              bgcolor: '#89c9fb'
            }
          }}
          onClick={() => {
            handleClick()
          }}
        >
          {sessionRunning ? 'Stop Session' : 'Start Session'}
        </Button>
      )}

      <Slouch
        postureData={postureData}
        startPosition={startPosition}
        slouchCount={slouchCount}
        setSlouchCount={setSlouchCount}
      />
      <LookAway
        postureData={postureData}
        startPosition={startPosition}
        notLookedAwayCount={notLookedAwayCount}
        setNotLookedAwayCount={setNotLookedAwayCount}
      />
      <EyeDistance
        postureData={postureData}
        startPosition={startPosition}
        tooCloseCount={tooCloseCount}
        setTooCloseCount={setTooCloseCount}
      />
    </>
  )
}

export default PostureDetection
