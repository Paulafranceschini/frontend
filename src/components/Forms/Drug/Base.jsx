import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';
import { Checkbox } from 'antd';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { InputNumber, Select } from '@components/Inputs';
import Tooltip from '@components/Tooltip';

import { Box } from './Drug.style';

export default function Base({ units, security }) {
  const { values, setFieldValue } = useFormikContext();
  const {
    antimicro,
    mav,
    controlled,
    notdefault,
    maxDose,
    kidney,
    liver,
    elderly,
    unit,
    division,
    useWeight,
    idMeasureUnit,
    amount
  } = values;

  return (
    <>
      <Col md={24} xs={24}>
        <Box css="align-items: flex-start;">
          <Heading as="label" size="14px" className="fixed" css="margin-top: 12px;">
            Classificação:
          </Heading>
          <div style={{ width: '535px' }}>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('antimicro', !target.value)}
                value={antimicro}
                checked={antimicro}
                name="antimicro"
                id="antimicro"
              >
                Antimicrobiano
              </Checkbox>
            </Col>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('mav', !target.value)}
                value={mav}
                checked={mav}
                name="mav"
                id="mav"
              >
                Alta vigilância
              </Checkbox>
            </Col>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('controlled', !target.value)}
                value={controlled}
                checked={controlled}
                name="controlled"
                id="controlled"
              >
                Controlados
              </Checkbox>
            </Col>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('notdefault', !target.value)}
                value={notdefault}
                checked={notdefault}
                name="notdefault"
                id="notdefault"
              >
                Não padronizado
              </Checkbox>
            </Col>
            <Col xs={8}>
              <Checkbox
                onChange={({ target }) => setFieldValue('elderly', !target.value)}
                value={elderly}
                checked={elderly}
                name="elderly"
                id="elderly"
              >
                <Tooltip title="Medicamento Potencialmente Inapropriado para Idosos">MPI</Tooltip>
              </Checkbox>
            </Col>
          </div>
        </Box>
      </Col>
      <Col xs={24}>
        <Box>
          <Heading as="label" size="14px" className="fixed">
            <Tooltip title="Dose de Alerta Diária">Dose de Alerta:</Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={maxDose}
            onChange={value => setFieldValue('maxDose', value)}
          />{' '}
          {unit}
          {useWeight ? '/Kg' : ''}
        </Box>
      </Col>
      <Col md={24} xs={24}>
        <Box>
          <Heading as="label" size="14px" margin="0 0 10px" className="fixed">
            <Tooltip title="Valor de Taxa de Filtração Glomerular (CKD-EPI) a partir do qual o medicamento deve sofrer ajuste de dose ou frequência.">
              Nefrotóxico
            </Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: 5
            }}
            min={0}
            max={100}
            value={kidney}
            onChange={value => setFieldValue('kidney', value)}
          />
          mL/min
        </Box>
      </Col>
      <Col xs={24}>
        <Box>
          <Heading as="label" size="14px" className="fixed">
            <Tooltip title="Valor de TGO ou TGP a partir do qual o medicamento deve sofrer ajuste de dose ou frequência.">
              Hepatotóxico:
            </Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={liver}
            onChange={value => setFieldValue('liver', value)}
          />
          U/L
        </Box>
      </Col>
      {security.isAdmin() && (
        <Col xs={24}>
          <Box>
            <Heading as="label" size="14px" className="fixed">
              <Tooltip title="">Divisor de faixas:</Tooltip>
            </Heading>
            <InputNumber
              style={{
                width: 120,
                marginRight: '10px'
              }}
              min={0}
              max={99999}
              value={division}
              onChange={value => setFieldValue('division', value)}
            />
            <Checkbox
              onChange={({ target }) => setFieldValue('useWeight', !target.value)}
              value={useWeight}
              checked={useWeight}
              name="useWeight"
              id="useWeight"
            >
              <Tooltip title="">Considerar peso</Tooltip>
            </Checkbox>
          </Box>
        </Col>
      )}
      <Col xs={24}>
        <Box>
          <Heading as="label" size="14px" className="fixed">
            <Tooltip title="">Concentração:</Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginRight: '10px'
            }}
            min={0}
            max={99999}
            value={amount}
            onChange={value => setFieldValue('amount', value)}
          />
        </Box>
      </Col>
      <Col md={24} xs={24}>
        <Box>
          <Heading as="label" size="14px" className="fixed">
            Unidade Padrão:
          </Heading>
          <Select
            placeholder="Selecione a unidade de medida padrão para este medicamento"
            onChange={value => setFieldValue('idMeasureUnit', value)}
            value={idMeasureUnit}
            identify="idMeasureUnit"
            allowClear
            style={{ minWidth: '300px' }}
          >
            {units.map(unit => (
              <Select.Option value={unit.idMeasureUnit} key={unit.idMeasureUnit}>
                {unit.description}
              </Select.Option>
            ))}
          </Select>
        </Box>
      </Col>
    </>
  );
}

//<FieldSet style={{ marginBottom: '25px', marginTop: '25px' }}>
//  <Heading as="label" size="16px" margin="0 0 10px">
//    Unidade de medida padrão:
//  </Heading>
//  <Select
//    placeholder="Selecione a unidade de medida padrão para este medicamento"
//    onChange={value => setFieldValue('idMeasureUnit', value)}
//    value={idMeasureUnit}
//    identify="idMeasureUnit"
//    allowClear
//    style={{ minWidth: '300px' }}
//  >
//    {units.map(unit => (
//      <Select.Option value={unit.idMeasureUnit} key={unit.idMeasureUnit}>
//        {unit.description}
//      </Select.Option>
//    ))}
//  </Select>
//</FieldSet>
