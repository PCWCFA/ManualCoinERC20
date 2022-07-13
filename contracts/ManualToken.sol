// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/* @title ManualToken
 * @author PCWCFA
 * @dev This contract implements https://eips.ethereum.org/EIPS/eip-20 for a
 *   token named Manual Token with symbol MT.
 */

error ManualToken__NotEnoughTokens(address _from, address to, uint256 _value);

contract ManualToken {
  string private constant TOKEN_NAME = "ManualToken";
  string private constant TOKEN_SYMBOL = "MT";
  uint8 private constant DECIMALS = 8;
  uint256 private immutable i_totalSupply;
  address private immutable i_owner;
  event Transfer(address indexed _from, address indexed _to, uint256 _value);
  event Approval(
    address indexed _owner,
    address indexed _spender,
    uint256 _value
  );

  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowances;

  constructor(uint256 _totalSupply) {
    i_owner = msg.sender;
    i_totalSupply = _totalSupply;
    balanceOf[i_owner] = i_totalSupply;
  }

  function name() public view returns (string memory) {
    return TOKEN_NAME;
  }

  function symbol() public view returns (string memory) {
    return TOKEN_SYMBOL;
  }

  function decimals() public view returns (uint8) {
    return DECIMALS;
  }

  function totalSupply() public view returns (uint256) {
    return i_totalSupply;
  }

  function balanceof(address _owner) public view returns (uint256 balance) {
    return balanceOf[_owner];
  }

  function _internalTransfer(
    address _from,
    address _to,
    uint256 _value
  ) internal {
    uint256 toOriginalBalance;
    uint256 fromOriginalBalance;

    if (_value > 0 && balanceOf[_from] < _value) {
      revert ManualToken__NotEnoughTokens(_from, _to, _value);
    }

    fromOriginalBalance = balanceOf[_from];
    toOriginalBalance = balanceOf[_to];

    balanceOf[_from] -= _value;
    balanceOf[_to] += _value;

    assert(balanceOf[_from] == fromOriginalBalance - _value);
    assert(balanceOf[_to] == toOriginalBalance + _value);

    emit Transfer(_from, _to, _value);
  }

  function transfer(address _to, uint256 _value) public returns (bool success) {
    _internalTransfer(msg.sender, _to, _value);
    return true;
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _value
  ) public returns (bool success) {
    require(_value <= allowances[_from][msg.sender]);
    allowances[_from][msg.sender] -= _value;
    _internalTransfer(_from, _to, _value);
    return true;
  }

  function approve(address _spender, uint256 _value)
    public
    returns (bool success)
  {
    allowances[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  function allowance(address _owner, address _spender)
    public
    view
    returns (uint256 remaining)
  {
    return allowances[_owner][_spender];
  }

  function getOwner() public view returns (address) {
    return i_owner;
  }
}
