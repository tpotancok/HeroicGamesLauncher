import {
  BottleSelect,
  SelectField,
  ToggleSwitch,
  TextInputField,
  PathSelectionBox
} from 'frontend/components/UI'
import React from 'react'
import { WineInstallation } from 'common/types'
import { useTranslation } from 'react-i18next'
import { removeSpecialcharacters } from 'frontend/helpers'

type Props = {
  setWineVersion: React.Dispatch<
    React.SetStateAction<WineInstallation | undefined>
  >
  setWinePrefix: React.Dispatch<React.SetStateAction<string>>
  setCrossoverBottle: React.Dispatch<React.SetStateAction<string>>
  setBottlesBottle: React.Dispatch<React.SetStateAction<string>>
  winePrefix: string
  crossoverBottle: string
  bottlesBottle: string
  wineVersionList: WineInstallation[]
  wineVersion: WineInstallation | undefined
  title?: string
}

export default function WineSelector({
  setWinePrefix,
  setWineVersion,
  winePrefix,
  wineVersionList,
  wineVersion,
  title = 'sideload',
  crossoverBottle,
  setCrossoverBottle,
  bottlesBottle,
  setBottlesBottle
}: Props) {
  const { t } = useTranslation('gamepage')

  const [useDefaultSettings, setUseDefaultSettings] = React.useState(false)
  const [description, setDescription] = React.useState('')

  React.useEffect(() => {
    const getAppSettings = async () => {
      const {
        defaultWinePrefix: prefixFolder,
        wineVersion,
        winePrefix: defaultPrefix,
        wineCrossoverBottle: defaultBottle,
        bottlesBottle: defaultLinuxBottle
      } = await window.api.requestAppSettings()

      if (!wineVersion || !defaultPrefix || !defaultBottle) return
      setDescription(
        `${defaultPrefix} / ${wineVersion.name.replace('Proton - ', '')}`
      )

      if (!useDefaultSettings && wineVersion.type === 'crossover') {
        return setCrossoverBottle(defaultBottle)
      }

      if (!useDefaultSettings && wineVersion.type === 'bottles') {
        return setBottlesBottle(defaultLinuxBottle)
      }

      if (useDefaultSettings) {
        setWinePrefix(defaultPrefix)
        setWineVersion(wineVersion)
        setCrossoverBottle(defaultBottle)
        setBottlesBottle(defaultLinuxBottle)
      } else {
        const suggestedWinePrefix = `${prefixFolder}/${removeSpecialcharacters(
          title
        )}`
        setWinePrefix(suggestedWinePrefix)
        setWineVersion(wineVersion || undefined)
      }
    }
    getAppSettings()
  }, [useDefaultSettings])

  const showPrefix =
    wineVersion?.type !== 'crossover' && wineVersion?.type !== 'bottles'
  const showBottle = wineVersion?.type === 'crossover'
  const showLinuxBottle = wineVersion?.type === 'bottles'

  return (
    <>
      <ToggleSwitch
        htmlId="use-wine-defaults"
        title={t(
          'setting.use-default-wine-settings',
          'Use Default Wine Settings'
        )}
        value={useDefaultSettings}
        handleChange={() => setUseDefaultSettings(!useDefaultSettings)}
        description={description}
      />
      {!useDefaultSettings && (
        <>
          {showPrefix && (
            <PathSelectionBox
              type="directory"
              onPathChange={setWinePrefix}
              path={winePrefix}
              pathDialogTitle={t('box.wineprefix', 'Select WinePrefix Folder')}
              label={t('install.wineprefix', 'WinePrefix')}
              htmlId="setinstallpath"
              noDeleteButton
            />
          )}
          {showBottle && (
            <TextInputField
              label={t('setting.winecrossoverbottle', 'CrossOver Bottle')}
              htmlId="crossoverBottle"
              value={crossoverBottle}
              onChange={(event) => setCrossoverBottle(event.target.value)}
            />
          )}
          {showLinuxBottle && (
            <BottleSelect
              wineVersion={wineVersion}
              selectedBottle={bottlesBottle}
              setSelectedBottle={setBottlesBottle}
            />
          )}

          <SelectField
            label={`${t('install.wineversion')}:`}
            htmlId="wineVersion"
            value={wineVersion?.name || ''}
            onChange={(e) =>
              setWineVersion(
                wineVersionList.find(
                  (version) => version.name === e.target.value
                )
              )
            }
          >
            {wineVersionList &&
              wineVersionList.map(({ name }, i) => (
                <option value={name} key={i}>
                  {name}
                </option>
              ))}
          </SelectField>
        </>
      )}
    </>
  )
}
