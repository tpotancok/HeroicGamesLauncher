import { spawn } from 'child_process'
import { logDebug, LogPrefix } from '../logger/logger'
import { isFlatpak } from '../constants'
import { BottlesType } from 'common/types'

function prepareBottlesCommand(
  args: string[],
  bottlesType: BottlesType,
  noCli?: boolean
): string[] {
  const command: string[] = []

  if (isFlatpak) {
    command.push(...['flatpak-spawn', '--host'])
  }

  if (bottlesType === 'flatpak') {
    command.push(...['flatpak', 'run'])
    if (!noCli) {
      command.push('--command=bottles-cli')
    }
    command.push('com.usebottles.bottles')
  } else {
    if (!noCli) {
      command.push('bottles-cli')
    } else {
      command.push('bottles')
    }
  }

  command.push(...args)
  return command
}

async function getBottlesNames(bottlesType: BottlesType): Promise<string[]> {
  // Prepare command
  const { stdout } = await runBottlesCommand(
    ['--json', 'list', 'bottles'],
    bottlesType
  )

  const jsonStart = stdout.indexOf('{')
  const parsedData = JSON.parse(stdout.trim().slice(jsonStart))
  return Object.keys(parsedData)
}

async function runBottlesCommand(
  command: string[],
  bottlesType: BottlesType,
  noCli?: boolean
): Promise<{ stdout: string; stderr: string; error: boolean }> {
  const [exe, ...bottlesCommand] = prepareBottlesCommand(
    command,
    bottlesType,
    noCli
  )
  logDebug(['Launching bottles command', exe, bottlesCommand.join(' ')], {
    prefix: LogPrefix.Backend
  })
  const process = spawn(exe, bottlesCommand)

  let stdout = ''
  let stderr = ''
  process.stdout.setEncoding('utf-8')
  process.stderr.setEncoding('utf-8')
  return new Promise((res) => {
    process.stdout.addListener('data', (data) => {
      if (data) {
        stdout += data
      }
    })
    process.stderr.addListener('data', (data) => {
      if (data) {
        stderr += data
      }
    })
    process.addListener('error', () => {
      res({
        stdout,
        stderr,
        error: true
      })
    })
    process.addListener('close', (code) => {
      res({
        stdout,
        stderr,
        error: code !== 0
      })
    })
  })
}

async function openBottles(bottlesType: BottlesType, bottle?: string) {
  const [exe, ...args] = bottle
    ? prepareBottlesCommand(['-b', bottle], bottlesType, true)
    : prepareBottlesCommand([], bottlesType, true)
  logDebug(['Opening Bottles', exe, args.join(' ')], {
    prefix: LogPrefix.Backend
  })
  spawn(exe, args)
}

export {
  getBottlesNames,
  prepareBottlesCommand,
  runBottlesCommand,
  openBottles
}
