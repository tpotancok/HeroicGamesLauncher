import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectField } from 'frontend/components/UI'
import { WineInstallation } from 'common/types'

interface Props {
  wineVersion: WineInstallation
  selectedBottle: string
  setSelectedBottle: React.Dispatch<React.SetStateAction<string>>
}

export default function BottleSelect({
  wineVersion,
  selectedBottle,
  setSelectedBottle
}: Props) {
  const { t } = useTranslation()

  const [bottlesNames, setBottlesNames] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    const getBottlesNames = async () => {
      const bottlesNames = await window.api.getBottlesNames(
        wineVersion.subtype!
      )
      if (!cancelled) setBottlesNames(bottlesNames)
    }

    getBottlesNames()
    return () => {
      cancelled = true
    }
  }, [])

  if (wineVersion.type !== 'bottles') {
    return <></>
  }

  return (
    <>
      <SelectField
        label={t('setting.bottles.bottle', 'Bottle')}
        htmlId="setBottlesBottleName"
        value={selectedBottle}
        onChange={(event) => {
          setSelectedBottle(event.target.value)
        }}
      >
        {bottlesNames.map((value, index) => (
          <option key={'bottle' + index} value={value}>
            {value}
          </option>
        ))}
      </SelectField>
    </>
  )
}
