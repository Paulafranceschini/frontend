import React from 'react';
import 'styled-components/macro';
import { useFormikContext } from 'formik';

import { Col } from '@components/Grid';
import Heading from '@components/Heading';
import { InputNumber } from '@components/Inputs';
import Tooltip from '@components/Tooltip';

import { Box } from './Patient.style';

export default function Base() {
  const { values, setFieldValue, errors } = useFormikContext();
  const { weight, height } = values;

  return (
    <>
      <Col xs={24}>
        <Box hasError={errors.weight}>
          <Heading as="label" size="14px">
            <Tooltip title="">Peso:</Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginLeft: 10,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={weight}
            onChange={value => setFieldValue('weight', value)}
          />{' '}
          Kg
        </Box>
      </Col>
      <Col xs={24}>
        <Box hasError={errors.height}>
          <Heading as="label" size="14px">
            <Tooltip title="">Altura:</Tooltip>
          </Heading>
          <InputNumber
            style={{
              width: 120,
              marginLeft: 10,
              marginRight: 5
            }}
            min={0}
            max={99999}
            value={height}
            onChange={value => setFieldValue('height', value)}
          />{' '}
          cm
        </Box>
      </Col>
    </>
  );
}
