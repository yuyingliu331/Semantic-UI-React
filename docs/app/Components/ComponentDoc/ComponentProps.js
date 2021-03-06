import _ from 'lodash'
import React, { Component, PropTypes } from 'react'

import { Label, Table } from 'src'

/**
 * Displays a table of a Component's PropTypes.
 */
export default class ComponentProps extends Component {
  static propTypes = {
    /**
     * A single Component's prop info as generated by react-docgen.
     * @type {object} Props info object where keys are prop names and values are prop definitions.
     */
    props: PropTypes.object,
    /**
     * A single Component's meta info.
     * @type {object} Meta info object where enum prop values are defined.
     */
    meta: PropTypes.object,
  }

  renderName = item => <code>{item.name}</code>

  requiredRenderer = item => item.required && <Label size='mini' color='red' circular>required</Label>

  renderDefaultValue = (item) => {
    let defaultValue = _.get(item, 'defaultValue.value')

    if (_.startsWith(defaultValue, 'function ')) {
      defaultValue = defaultValue.match(/^function(.*)\{/)[1].trim()
    }

    const defaultIsComputed = <span className='ui mini gray circular label'>computed</span>

    return (
      <div>
        {defaultValue} {_.get(item, 'defaultValue.computed') && defaultIsComputed}
      </div>
    )
  }

  renderFunctionSignature = (item) => {
    if (item.type !== '{func}') return

    const params = _.filter(item.tags, { title: 'param' })
    const paramSignature = params
      .map(param => `${param.name}: ${param.type.name}`)
      .join(', ')

    const paramDescriptions = params.map(param => (
      <div style={{ color: '#888' }} key={param.name}>
        <strong>{param.name}</strong> - {param.description}
      </div>
    ))

    const signature = <pre><code>{item.name}({paramSignature})</code></pre>

    return (
      <div>
        <strong>Signature:</strong>
        {signature}
        {paramDescriptions}
      </div>
    )
  }

  render() {
    const { props: propsDefinition } = this.props
    const content = _.sortBy(_.map(propsDefinition, (config, name) => {
      const value = _.get(config, 'type.value')
      let type = _.get(config, 'type.name')
      if (type === 'union') {
        type = _.map(value, (val) => val.name).join('|')
      }
      type = type && `{${type}}`

      const description = _.get(config, 'docBlock.description', '')

      return {
        name,
        type,
        value,
        tags: _.get(config, 'docBlock.tags'),
        required: config.required,
        defaultValue: config.defaultValue,
        description: description && description.split('\n').map(l => ([l, <br key={l} />])),
      }
    }), 'name')

    return (
      <Table data={content} className='very basic compact'>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell />
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Default</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {_.map(content, item => (
            <Table.Row key={item.name}>
              <Table.Cell>{this.renderName(item)}</Table.Cell>
              <Table.Cell>{this.requiredRenderer(item)}</Table.Cell>
              <Table.Cell>{item.type}</Table.Cell>
              <Table.Cell>{this.renderDefaultValue(item.defaultValue)}</Table.Cell>
              <Table.Cell>
                {item.description && <p>{item.description}</p>}
                {this.renderFunctionSignature(item)}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    )
  }
}
